package ro.ase.cts.clase.decorator;

public class AmbalajPremium extends Personalizare{
    public AmbalajPremium(AbstractProdusPersonalizat produsPersonalizat) {
        super(produsPersonalizat);
    }

    @Override
    public double calculeazaPret() {
        return super.calculeazaPret() + 12;
    }

    @Override
    public String obtineDescriere() {
        return super.obtineDescriere() + "S-a adaugat personalizare: ambalaj premium.";
    }
}
