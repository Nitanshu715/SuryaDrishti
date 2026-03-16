"""
train.py
========
Trains a Random Forest classifier on pixel-wise features
(NDVI, Temperature, LULC) to predict UHI heat risk zones.

Outputs:
  data/outputs/model.pkl       — trained model
  data/outputs/model_metrics.json  — accuracy, F1, confusion matrix
  data/outputs/feature_importance.json

Run: python backend/ml/train.py
"""

import json
import joblib
import numpy as np
from pathlib import Path
from datetime import datetime

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    accuracy_score, f1_score, classification_report,
    confusion_matrix
)
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

ROOT            = Path(__file__).resolve().parents[2]
DATA_PROCESSED  = ROOT / "data" / "processed"
DATA_OUTPUTS    = ROOT / "data" / "outputs"
DATA_OUTPUTS.mkdir(parents=True, exist_ok=True)

FEATURE_NAMES = ["NDVI", "Temperature (°C)", "LULC Class"]

CLASS_NAMES = {
    1: "Very Low",
    2: "Low",
    3: "Moderate",
    4: "High",
    5: "Very High",
}


def load_data():
    X_path = DATA_PROCESSED / "X_features.npy"
    y_path = DATA_PROCESSED / "y_labels.npy"

    if not X_path.exists():
        raise FileNotFoundError(
            f"Feature matrix not found.\n"
            f"Run: python backend/ml/preprocess.py first"
        )

    X = np.load(X_path)
    y = np.load(y_path)
    print(f"Loaded: X={X.shape}, y={y.shape}")
    return X, y


def sample_balanced(X, y, max_per_class=50_000):
    """Downsample large classes to keep training fast + balanced."""
    idx_all = []
    for cls in np.unique(y):
        idx = np.where(y == cls)[0]
        if len(idx) > max_per_class:
            idx = np.random.choice(idx, max_per_class, replace=False)
        idx_all.append(idx)
    idx_all = np.concatenate(idx_all)
    np.random.shuffle(idx_all)
    return X[idx_all], y[idx_all]


def build_model():
    """Build Random Forest pipeline with optional scaling."""
    clf = RandomForestClassifier(
        n_estimators=150,
        max_depth=12,
        min_samples_split=20,
        min_samples_leaf=10,
        class_weight="balanced",
        n_jobs=-1,
        random_state=42,
    )
    return clf


def train(X, y):
    print("\n[1/3] Splitting data...")
    X_bal, y_bal = sample_balanced(X, y)
    print(f"  Balanced dataset: {X_bal.shape[0]:,} pixels")

    X_train, X_test, y_train, y_test = train_test_split(
        X_bal, y_bal, test_size=0.2, random_state=42, stratify=y_bal
    )
    print(f"  Train: {len(X_train):,}  |  Test: {len(X_test):,}")

    print("\n[2/3] Training Random Forest...")
    model = build_model()
    model.fit(X_train, y_train)
    print("  Training complete!")

    print("\n[3/3] Evaluating model...")
    y_pred = model.predict(X_test)

    acc    = accuracy_score(y_test, y_pred)
    f1_mac = f1_score(y_test, y_pred, average="macro")
    f1_wt  = f1_score(y_test, y_pred, average="weighted")
    cm     = confusion_matrix(y_test, y_pred).tolist()
    report = classification_report(y_test, y_pred, output_dict=True)

    print(f"\n  Accuracy  : {acc*100:.2f}%")
    print(f"  F1 Macro  : {f1_mac:.4f}")
    print(f"  F1 Weighted: {f1_wt:.4f}")

    # Cross-validation
    cv_scores = cross_val_score(model, X_bal, y_bal, cv=5, scoring="f1_macro")
    print(f"  CV F1 (5-fold): {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    metrics = {
        "timestamp":        datetime.now().isoformat(),
        "model":            "RandomForestClassifier",
        "n_estimators":     150,
        "training_pixels":  int(len(X_train)),
        "test_pixels":      int(len(X_test)),
        "accuracy":         round(float(acc), 4),
        "f1_macro":         round(float(f1_mac), 4),
        "f1_weighted":      round(float(f1_wt), 4),
        "cv_f1_mean":       round(float(cv_scores.mean()), 4),
        "cv_f1_std":        round(float(cv_scores.std()), 4),
        "confusion_matrix": cm,
        "class_report":     report,
        "class_names":      CLASS_NAMES,
    }

    importance = {
        FEATURE_NAMES[i]: round(float(v), 6)
        for i, v in enumerate(model.feature_importances_)
    }
    print(f"\n  Feature Importances:")
    for feat, imp in importance.items():
        bar = "█" * int(imp * 40)
        print(f"    {feat:<25} {imp:.4f}  {bar}")

    return model, metrics, importance


def main():
    print("=" * 55)
    print("  Delhi UHI Platform — Model Training")
    print("=" * 55)

    X, y = load_data()
    model, metrics, importance = train(X, y)

    # Save model
    model_path = DATA_OUTPUTS / "model.pkl"
    joblib.dump(model, model_path)
    print(f"\n✅ Model saved: {model_path}")

    with open(DATA_OUTPUTS / "model_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"✅ Metrics saved: {DATA_OUTPUTS}/model_metrics.json")

    with open(DATA_OUTPUTS / "feature_importance.json", "w") as f:
        json.dump(importance, f, indent=2)

    print("\nNext: python backend/ml/predict.py")


if __name__ == "__main__":
    main()
