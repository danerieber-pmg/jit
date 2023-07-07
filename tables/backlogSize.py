import csv
from dateutil import parser
import matplotlib.pyplot as plt
import numpy as np

DAY_FORMAT = "%Y-%m-%d"

with open("./csv/issues.csv", "r") as f:
    reader = csv.reader(f, delimiter=",")

    U = {}
    B = {}
    for i, line in enumerate(reader):
        if i == 0:
            continue
        created = parser.parse(line[0]).strftime(DAY_FORMAT) if line[0] else None
        resolved = parser.parse(line[1]).strftime(DAY_FORMAT) if line[1] else None

        if created is not None:
            if created not in B:
                B[created] = 0
            B[created] += 1
            if not resolved:
                if created not in U:
                    U[created] = 0
                U[created] += 1

        if resolved is not None:
            if resolved not in B:
                B[resolved] = 0
            B[resolved] -= 1

    def accumulate(data):
        data = [[day, n] for day, n in data.items()]
        data.sort(key=lambda d: d[0])
        for i, d in enumerate(data):
            if i == 0:
                continue
            data[i][1] = data[i - 1][1] + d[1]
        return data

    B = accumulate(B)
    U = accumulate(U)

    def plot(data):
        plt.plot([np.datetime64(d[0]) for d in data], [d[1] for d in data])

    plot(B)
    plot(U)

    plt.show()
