import pandas as pd
from sklearn.ensemble import RandomForestRegressor

df = pd.read_csv("data.csv")

X = df[["hour", "day"]]
y = df["traffic"]

model = RandomForestRegressor()
model.fit(X, y)

def predict_traffic(hour, day):
    input_data = pd.DataFrame([[hour, day]], columns=["hour", "day"])
    prediction = model.predict(input_data)
    return float(prediction[0])