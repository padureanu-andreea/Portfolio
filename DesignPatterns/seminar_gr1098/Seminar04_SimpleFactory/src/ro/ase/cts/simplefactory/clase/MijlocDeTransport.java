package ro.ase.cts.simplefactory.clase;

public abstract class MijlocDeTransport {
    protected int numarRoti;
    protected String numarInmatriculare;

    public MijlocDeTransport(int numarRoti, String numarInmatriculare) {
        this.numarRoti = numarRoti;
        this.numarInmatriculare = numarInmatriculare;
    }

    public abstract void afiseazaDetalii();
}
