import csv
from dateutil import parser
import matplotlib.pyplot as plt
import numpy as np

DAY_FORMAT = "%Y-%m-%d"

with open("./csv/issues.csv", "r") as f:
    reader = csv.reader(f, delimiter=",")

    R = {}
    for i, line in enumerate(reader):
        if i == 0:
            continue
        created = parser.parse(line[0]).strftime(DAY_FORMAT) if line[0] else None
        resolved = parser.parse(line[1]).strftime(DAY_FORMAT) if line[1] else None
        status = line[2]

        def track(status, date, delta):
            if status not in R:
                R[status] = {}
            if date not in R[status]:
                R[status][date] = 0
            R[status][date] += delta

        if status:
            if created:
                track(status, created, 1)
            if resolved:
                track(status, resolved, -1)
    

    for s1 in R:
        for date in R[s1]:
            for s2 in R:
                if s1 != s2 and date not in R[s2]:
                    R[s2][date] = 0


    def accumulate(data):
        data = [[day, n] for day, n in data.items()]
        data.sort(key=lambda d: d[0])
        for i, d in enumerate(data):
            if i == 0:
                continue
            data[i][1] = data[i - 1][1] + d[1]
        return data

    statuses = list(R.keys())
    R = [accumulate(R[status]) for status in R]

    def format(data):
        return [d[1] for d in data]

    plt.stackplot([np.datetime64(d[0]) for d in R[0]], [format(data) for data in R], baseline='wiggle')
    plt.legend(statuses, loc='upper left')

    plt.show()
