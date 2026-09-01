package ro.ase.cts.simplefactory.clase;

public class Troleibuz extends MijlocDeTransport {
    public Troleibuz(int numarRoti, String numarInmatriculare) {
        super(numarRoti, numarInmatriculare);
    }

    @Override
    public void afiseazaDetalii() {
        StringBuilder builder = new StringBuilder();
        builder.append("Troleibuzul are ");
        builder.append(super.numarRoti);
        builder.append(" roti si numarul de inmatriculare este: ");
        builder.append(super.numarInmatriculare);
        System.out.println(builder);
    }
}
