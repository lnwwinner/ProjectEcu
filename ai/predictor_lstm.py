import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense

class LSTMPredictor:
    def __init__(self, input_shape=(10, 3)):
        self.model = Sequential([
            LSTM(64, return_sequences=True, input_shape=input_shape),
            LSTM(32),
            Dense(16, activation='relu'),
            Dense(1)
        ])
        self.model.compile(optimizer='adam', loss='mse')

    def train(self, X, y, epochs=10):
        self.model.fit(X, y, epochs=epochs, verbose=1)

    def predict(self, X):
        return self.model.predict(X)
