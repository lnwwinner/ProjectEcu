from sklearn.ensemble import IsolationForest
import numpy as np


class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(contamination=0.05)
        self.trained = False

    def train(self, dataset):
        X = np.array(dataset)
        self.model.fit(X)
        self.trained = True

    def predict(self, data):
        if not self.trained:
            return 0
        return self.model.predict([data])[0]
