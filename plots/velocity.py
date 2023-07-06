import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("./csv/velocity.csv")

ticks = []
for sprint in df.sprint.unique():
    df_sub = df[(df.sprint == sprint) | (df.sprint.shift(1) == sprint)]
    plt.plot(df_sub.day, df_sub.points)

    ticks.append(df_sub.iloc[0])

plt.xticks([tick.day for tick in ticks], [tick.sprint for tick in ticks])
plt.show()