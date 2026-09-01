package ro.ase.cts.clase.decorator;

public class TextPersonalizat extends Personalizare{
    public TextPersonalizat(AbstractProdusPersonalizat produsPersonalizat) {
        super(produsPersonalizat);
    }

    @Override
    public double calculeazaPret() {
        return super.calculeazaPret() + 10;
    }

    @Override
    public String obtineDescriere() {
        return super.obtineDescriere() + "S-a adaugat personalizare: text personalizat.";
    }
}
