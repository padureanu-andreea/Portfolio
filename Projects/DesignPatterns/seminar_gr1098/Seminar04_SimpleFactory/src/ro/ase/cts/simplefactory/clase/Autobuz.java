package ro.ase.cts.simplefactory.clase;

public class Autobuz extends MijlocDeTransport {
    public Autobuz(int numarRoti, String numarInmatriculare) {
        super(numarRoti, numarInmatriculare);
    }

    @Override
    public void afiseazaDetalii() {
        StringBuilder builder = new StringBuilder();
        builder.append("Autobuzul are ");
        builder.append(super.numarRoti);
        builder.append(" roti si numarul de inmatriculare este: ");
        builder.append(super.numarInmatriculare);
        System.out.println(builder);
    }
}
