package ro.ase.cts.clase;

public abstract class BauturaAbstracta implements IBautura{
    protected String nume;
    protected int volum;
    protected double pret;

    public BauturaAbstracta(String nume, int volum, double pret) {
        this.nume = nume;
        this.volum = volum;
        this.pret = pret;
    }

    public BauturaAbstracta() {
    }
}
