package ro.ase.cts.clase.decorator;

public class ImagineImprimata extends Personalizare{
    public ImagineImprimata(AbstractProdusPersonalizat produsPersonalizat) {
        super(produsPersonalizat);
    }

    @Override
    public double calculeazaPret() {
        return super.calculeazaPret() + 20;
    }

    @Override
    public String obtineDescriere() {
        return super.obtineDescriere() + "S-a adaugat personalizare: imagine imprimata.";
    }
}
