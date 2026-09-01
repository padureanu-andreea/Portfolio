package ro.ase.cts.clase.decorator;

public abstract class Personalizare implements AbstractProdusPersonalizat{
    private AbstractProdusPersonalizat produsPersonalizat;

    public Personalizare(AbstractProdusPersonalizat produsPersonalizat) {
        this.produsPersonalizat = produsPersonalizat;
    }

    @Override
    public double calculeazaPret() {
        return this.produsPersonalizat.calculeazaPret();
    }

    @Override
    public String obtineDescriere() {
        return this.produsPersonalizat.obtineDescriere();
    }
}
