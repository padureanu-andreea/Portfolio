import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from pandas.api.types import is_numeric_dtype
from matplotlib.colors import rgb2hex

def nan_replace(t: pd.DataFrame):
    for coloana in t.columns:
        if t[coloana].isna().any():
            if is_numeric_dtype(t[coloana]):
                t.fillna({coloana: t[coloana].mean()}, inplace=True)
            else:
                t.fillna({coloana: t[coloana].mode()[0]}, inplace=True)

def unique(a):
    k = np.unique(a, return_index=True)[1]
    return [a[i] for i in sorted(k)]

def partitie(h: np.ndarray, k=None):
    n = h.shape[0] + 1
    if k is None:
        d = h[1:, 2] - h[:n - 2, 2]
        nr_jonctiuni = np.argmax(d) + 1
        k = n - nr_jonctiuni
    else:
        nr_jonctiuni = n - k
    threshold = (h[nr_jonctiuni, 2] + h[nr_jonctiuni - 1, 2]) / 2
    c = np.arange(n)
    for j in range(nr_jonctiuni):
        k1 = h[j, 0]
        k2 = h[j, 1]
        c[c == k1] = n + j
        c[c == k2] = n + j
    partitie_rez = np.array(["C" + str(v + 1) for v in pd.Categorical(c).codes])
    return k, threshold, partitie_rez

def generare_rampa(denumire, nr_clusteri):
    cmap = plt.get_cmap(denumire, nr_clusteri)
    culori = [rgb2hex(cmap(i)) for i in range(nr_clusteri)]
    return culori