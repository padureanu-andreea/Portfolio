import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os
from scipy.cluster.hierarchy import linkage, leaves_list
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score, silhouette_samples
from sklearn.preprocessing import StandardScaler
import matplotlib
matplotlib.use('Agg')

import functii as f
import grafice as g

# creare folder-ului de output daca nu exista
os.makedirs('date_out', exist_ok=True)

# citirea si procesarea datelor
cale_fisier = "./date_in/date_proiect_dsad_bune.csv"
set_date = pd.read_csv(cale_fisier, index_col=0)

# curatarea format (conversie virgule in puncte daca e cazul)
for col in set_date.columns:
    if set_date[col].dtype == 'object':
        set_date[col] = set_date[col].astype(str).str.replace(',', '.', regex=False).astype(float)

variabile = list(set_date)

if set_date.isna().any().any():
    f.nan_replace(set_date)

# standardizarea
x_raw = set_date[variabile].values
scaler = StandardScaler()
x = scaler.fit_transform(x_raw)


# clusterizarea ierarhica
metoda = "ward"
h = linkage(x, method=metoda)
g.plot_elbow(h)
g.plot_dendrograma_generala(h, set_date.index)


# salvarea ierarhiei in format csv
t_h = pd.DataFrame(h, columns=["Cluster 1", "Cluster 2", "Distanta", "Frecventa"])
t_h.to_csv("date_out/Ierarhie.csv")

# calculul partitiilor
n = len(set_date)
clusteri_singleton = leaves_list(h)
partitii_de_calculat = [None, 3] # None va declansa calculul automat prin metoda cotului (Elbow)

t_partitii = pd.DataFrame(index=set_date.index)

# PCA
pca = PCA(2)
tz = pd.DataFrame(pca.fit_transform(x), set_date.index, ["z1", "z2"])

# bucla de procesare a partitiilor
for k_val in partitii_de_calculat:
    k, threshold, p = f.partitie(h, k_val)
    sil_med = silhouette_score(x, p)
    sil_instante = silhouette_samples(x, p)
    culori = f.generare_rampa("rainbow", k)

    # pregatirea culorilor pentru dendrograma
    culori_instante = []
    for i in range(n):
        # C1 -> index 0
        index_cluster = int(p[clusteri_singleton[i]][1:]) - 1
        culori_instante.append(culori[index_cluster])
    culori_dendr = f.unique(culori_instante)

    # generarea de grafice
    g.plot_ierarhie(h, threshold, f"Dendrograma (k={k}) - Scor Silhouette: {sil_med:.3f}", k, set_date.index, culori=culori_dendr)
    g.f_plot_silhouette(p, sil_instante, sil_med, culori, f"Plot Silhouette (k={k})")
    g.plot_scoruri(tz, "z1", "z2", p, clase=np.unique(p), titlu=f"Plot partitie (k={k})", etichete=True, culori=culori)

    for var in variabile:
        g.histograme(set_date, var, p, culori)

    t_partitii[f"P_{k}"] = p
    t_partitii[f"Silhouette_P_{k}"] = sil_instante

# salvarea rezultatelor finale
t_partitii.to_csv("date_out/Partitii.csv")

print("Proiect executat cu succes! Fișierele sunt în 'date_out'.")
# ca sa nu apara toate imaginile pe ecran
# plt.show()