package ro.ase.cts.clase.flyweight;

public class PictogramePersonalizareFlyweight implements AbstractPictogramaPersonalizare {
    private String tipPersonalizare;

    public PictogramePersonalizareFlyweight(String tipPersonalizare) {
        this.tipPersonalizare = tipPersonalizare;
        System.out.println("Tipul de personalizare este: " + this.tipPersonalizare);
    }

    @Override
    public void afiseaza(int x, int y, int dimensiune, String eticheta) {
        StringBuilder builder = new StringBuilder();
        builder.append("Tipul pictogramei de personalizare: ");
        builder.append(this.tipPersonalizare);
        builder.append(". Pozita pictogramei: x=").append(x).append(" y=").append(y);
        builder.append(". Dimensiunea pictogramei: ").append(dimensiune);
        builder.append(". Eticheta: ").append(eticheta).append(".");
        System.out.println(builder);
    }
}
