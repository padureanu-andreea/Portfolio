package ro.ase.cts.clase.decorator;

public class LivrareCadou extends Personalizare{
    public LivrareCadou(AbstractProdusPersonalizat produsPersonalizat) {
        super(produsPersonalizat);
    }

    @Override
    public double calculeazaPret() {
        return super.calculeazaPret() + 25;
    }

    @Override
    public String obtineDescriere() {
        return super.obtineDescriere() + "S-a adaugat personalizare: livrare cadou.";
    }
}
