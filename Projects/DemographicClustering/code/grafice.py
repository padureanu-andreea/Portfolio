import matplotlib.pyplot as plt
import numpy as np
from seaborn import scatterplot
from scipy.cluster.hierarchy import dendrogram, set_link_color_palette


def plot_scoruri(t, v1, v2, y, clase=None, titlu="Plot partitie", etichete=False, culori=None):
    fig = plt.figure(figsize=(9, 7))
    ax = fig.add_subplot(1, 1, 1)
    ax.set_title(titlu, fontdict={"fontsize": 14, "color": "b"})
    scatterplot(data=t, x=v1, y=v2, hue=y, hue_order=clase, ax=ax, palette=culori)
    if etichete:
        for j in range(len(t)):
            ax.text(t[v1].iloc[j], t[v2].iloc[j], t.index[j], fontsize=8)
    plt.savefig("date_out/plot_instante_" + v1 + "_" + v2 + "_" + str(len(clase)) + ".png")
    plt.close(fig)


def plot_ierarhie(h, threshold, titlu, k, etichete, culori=None):
    fig = plt.figure(figsize=(10, 7))
    ax = fig.add_subplot(1, 1, 1)
    ax.set_title(titlu, fontdict={"fontsize": 16, "color": "b"})

    if culori is not None:
        set_link_color_palette(culori)

    dendrogram(h, ax=ax, color_threshold=threshold, labels=etichete, leaf_rotation=90)

    # desenarea liniei punctate pentru pragul de taiere
    ax.axhline(y=threshold, color='r', linestyle='--', label=f'Prag tăiere (k={k})')
    ax.legend()

    plt.tight_layout()
    plt.savefig("date_out/dendr_" + str(k) + ".png")
    plt.close(fig)


def histograme(t, variabila, partitie, culori):
    clase = np.unique(partitie)
    q = len(clase)
    fig = plt.figure(figsize=(12, 6))
    fig.suptitle("Histograme pentru variabila " + variabila)
    min_max = (t[variabila].min(), t[variabila].max())
    ax = fig.subplots(1, q, sharey=True)
    if q == 1:
        ax = [ax]
    for i in range(q):
        axe = ax[i]
        axe.set_xlabel(str(clase[i]))
        axe.hist(t[partitie == clase[i]][variabila], range=min_max, color=culori[i], rwidth=0.9)
    plt.savefig("date_out/hist_" + variabila + "_" + str(q) + ".png")
    plt.close(fig)


def f_plot_silhouette(partitie, scoruri_silh, scor_silh, culori, titlu="Plot Silhouette"):
    fig = plt.figure(figsize=(10, 6))
    ax = fig.add_subplot(1, 1, 1)
    ax.set_title(titlu, fontsize=16)
    clusteri = np.unique(partitie)
    y_lower = 10
    index_culoare = 0
    for cluster in clusteri:
        coeficienti = scoruri_silh[partitie == cluster]
        coeficienti.sort()
        size = coeficienti.shape[0]
        y_upper = y_lower + size
        ax.fill_betweenx(np.arange(y_lower, y_upper), 0, coeficienti, alpha=0.7, color=culori[index_culoare])
        ax.text(-0.05, y_lower + size / 2, cluster)
        y_lower = y_upper + 10
        index_culoare += 1
    ax.axvline(scor_silh, color="red", linestyle="--", label=f"Scor mediu: {scor_silh:.3f}")
    ax.set_xlabel("Coeficienti Silhouette")
    ax.set_ylabel("Cluster")
    ax.legend()
    plt.savefig("date_out/silhouette_" + str(len(clusteri)) + ".png")
    plt.close(fig)


def plot_elbow(h):
    distante = h[:, 2]
    distante_rev = distante[::-1]
    k_values = np.arange(1, len(distante_rev) + 1)
    limit = min(15, len(k_values))

    fig = plt.figure(figsize=(8, 5))
    plt.plot(k_values[:limit], distante_rev[:limit], marker='o', linestyle='-', color='b')
    plt.title('Metoda Elbow - Determinarea numărului optim de clusteri', fontsize=14)
    plt.xlabel('Număr de clusteri (k)', fontsize=12)
    plt.ylabel('Distanța de fuziune', fontsize=12)
    plt.grid(True, linestyle='--', alpha=0.7)

    plt.savefig("date_out/elbow.png")
    plt.close(fig)


def plot_dendrograma_generala(h, etichete):
    fig = plt.figure(figsize=(12, 8))
    dendrogram(h, labels=etichete, leaf_rotation=90, leaf_font_size=10)
    plt.title("Dendrograma Generală - Structura ierarhică a județelor", fontsize=14)
    plt.xlabel("Județe", fontsize=12)
    plt.ylabel("Distanța de fuziune (Ward)", fontsize=12)
    plt.tight_layout()
    plt.savefig("date_out/dendrograma_generala.png")
    plt.close(fig)