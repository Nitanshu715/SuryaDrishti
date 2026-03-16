"""
predict.py
==========
Loads the trained model and generates:
  - Heat risk prediction raster (numpy + optionally GeoTIFF)
  - Hotspot summary JSON (high-risk zone statistics)
  - Colorized PNG map for the dashboard

Run: python backend/ml/predict.py
"""

import json
import joblib
import numpy as np
from pathlib import Path

try:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import matplotlib.colors as mcolors
    HAS_MPL = True
except ImportError:
    HAS_MPL = False

try:
    import cv2
    HAS_CV2 = True
except ImportError:
    HAS_CV2 = False

ROOT           = Path(__file__).resolve().parents[2]
DATA_PROCESSED = ROOT / "data" / "processed"
DATA_OUTPUTS   = ROOT / "data" / "outputs"
DATA_OUTPUTS.mkdir(parents=True, exist_ok=True)

# Heat risk color palette (matches UHI map legend)
RISK_COLORS = {
    0: (200, 200, 200),  # NoData  → grey
    1: (0,   0,   139),  # Very Low  → dark blue
    2: (100, 149, 237),  # Low       → cornflower blue
    3: (144, 238, 144),  # Moderate  → light green
    4: (255, 165,  0 ),  # High      → orange
    5: (220,  20,  60),  # Very High → crimson
}

RISK_LABELS = {
    1: "Very Low (<36°C)",
    2: "Low (36-39°C)",
    3: "Moderate (39-42°C)",
    4: "High (42-45°C)",
    5: "Very High (>45°C)",
}


def load_data():
    X_path    = DATA_PROCESSED / "X_features.npy"
    mask_path = DATA_PROCESSED / "valid_mask.npy"
    info_path = DATA_PROCESSED / "shape_info.json"

    if not X_path.exists():
        raise FileNotFoundError("Run preprocess.py first.")

    X          = np.load(X_path)
    valid_mask = np.load(mask_path)

    with open(info_path) as f:
        info = json.load(f)

    shape = tuple(info["raster_shape"])
    return X, valid_mask, shape


def predict(model, X, valid_mask, shape):
    print(f"[1/3] Running inference on {len(X):,} pixels...")

    # Predict in chunks to avoid memory issues
    chunk = 100_000
    preds = []
    for i in range(0, len(X), chunk):
        preds.append(model.predict(X[i:i+chunk]))
        if (i // chunk) % 5 == 0:
            print(f"  ... {min(i+chunk, len(X)):,}/{len(X):,}")
    preds = np.concatenate(preds)

    # Rebuild 2D risk map
    risk_map = np.zeros(shape, dtype=np.int32)
    risk_map.flat[np.where(valid_mask.flatten())[0]] = preds

    return risk_map


def colorize_map(risk_map):
    """Convert integer risk map to RGB image."""
    H, W = risk_map.shape
    rgb = np.zeros((H, W, 3), dtype=np.uint8)
    rgb[risk_map == 0] = RISK_COLORS[0]
    for cls in range(1, 6):
        mask = risk_map == cls
        rgb[mask] = RISK_COLORS[cls]
    return rgb


def compute_hotspot_stats(risk_map) -> dict:
    """Compute statistics for each heat zone."""
    total_valid = int((risk_map > 0).sum())
    zones = []
    for cls in range(1, 6):
        count = int((risk_map == cls).sum())
        pct   = round(100 * count / total_valid, 2) if total_valid > 0 else 0
        zones.append({
            "class":       cls,
            "label":       RISK_LABELS[cls],
            "pixel_count": count,
            "percentage":  pct,
        })
    return {
        "total_valid_pixels": total_valid,
        "zones": zones,
        "highest_risk_zone": RISK_LABELS[5],
        "critical_coverage_pct": next(z["percentage"] for z in zones if z["class"]==5),
    }


def save_png(rgb, path):
    """Save RGB numpy array as PNG."""
    try:
        from PIL import Image
        Image.fromarray(rgb).save(path)
        print(f"  Saved PNG: {path}")
    except Exception as e:
        print(f"  PNG save failed: {e}")


def save_matplotlib_figure(risk_map, path):
    """Save a labeled matplotlib figure of the risk map."""
    if not HAS_MPL:
        return

    cmap_colors = [
        "#8B0000",  # class 0 (nodata) — invisible
        "#00008B",  # 1 Very Low
        "#6495ED",  # 2 Low
        "#90EE90",  # 3 Moderate
        "#FFA500",  # 4 High
        "#DC143C",  # 5 Very High
    ]
    cmap = mcolors.ListedColormap(cmap_colors)
    bounds = [0, 1, 2, 3, 4, 5, 6]
    norm   = mcolors.BoundaryNorm(bounds, cmap.N)

    fig, ax = plt.subplots(figsize=(10, 10), facecolor="#0f1117")
    ax.set_facecolor("#0f1117")

    im = ax.imshow(risk_map, cmap=cmap, norm=norm, interpolation="nearest")

    cbar = fig.colorbar(im, ax=ax, fraction=0.03, pad=0.02,
                        ticks=[0.5, 1.5, 2.5, 3.5, 4.5, 5.5])
    cbar.ax.set_yticklabels(
        ["NoData", "Very Low", "Low", "Moderate", "High", "Very High"],
        color="white", fontsize=9
    )
    cbar.outline.set_edgecolor("white")

    ax.set_title("AI Predicted Heat Risk Map — Delhi (April 2025)",
                 color="white", fontsize=14, pad=15, fontweight="bold")
    ax.axis("off")

    plt.tight_layout()
    plt.savefig(path, dpi=150, bbox_inches="tight",
                facecolor="#0f1117")
    plt.close()
    print(f"  Saved figure: {path}")


def main():
    print("=" * 55)
    print("  Delhi UHI Platform — Prediction")
    print("=" * 55)

    # Load model
    model_path = DATA_OUTPUTS / "model.pkl"
    if not model_path.exists():
        raise FileNotFoundError("Train the model first: python backend/ml/train.py")

    print("[0/3] Loading model...")
    model = joblib.load(model_path)

    X, valid_mask, shape = load_data()

    print(f"[0/3] Raster shape: {shape}")

    risk_map = predict(model, X, valid_mask, shape)

    print("[2/3] Colorizing and saving outputs...")
    rgb = colorize_map(risk_map)

    # Save raw numpy risk map
    np.save(DATA_OUTPUTS / "heat_risk_map.npy", risk_map)

    # Save colorized PNG
    save_png(rgb, DATA_OUTPUTS / "heat_risk_map_color.png")

    # Save matplotlib figure
    save_matplotlib_figure(risk_map, DATA_OUTPUTS / "heat_risk_figure.png")

    print("[3/3] Computing hotspot statistics...")
    stats = compute_hotspot_stats(risk_map)

    with open(DATA_OUTPUTS / "hotspot_stats.json", "w") as f:
        json.dump(stats, f, indent=2)
    print(f"  Hotspot stats: {DATA_OUTPUTS}/hotspot_stats.json")

    # Print summary
    print("\n📊 Heat Risk Zone Summary:")
    print(f"  {'Zone':<25} {'Pixels':>10}  {'Coverage':>9}")
    print("  " + "-"*47)
    for z in stats["zones"]:
        bar = "█" * int(z["percentage"] / 2)
        print(f"  {z['label']:<25} {z['pixel_count']:>10,}  {z['percentage']:>8.1f}%  {bar}")

    print(f"\n✅ Prediction complete!")
    print(f"   Outputs in: {DATA_OUTPUTS}")
    print("\nNext: python backend/api/app.py")


if __name__ == "__main__":
    main()
