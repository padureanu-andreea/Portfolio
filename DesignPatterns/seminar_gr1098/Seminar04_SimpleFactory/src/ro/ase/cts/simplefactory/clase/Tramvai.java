package ro.ase.cts.simplefactory.clase;

public class Tramvai extends MijlocDeTransport {
    public Tramvai(int numarRoti, String numarInmatriculare) {
        super(numarRoti, numarInmatriculare);
    }

    @Override
    public void afiseazaDetalii() {
        StringBuilder builder = new StringBuilder();
        builder.append("Tramvaiul are ");
        builder.append(super.numarRoti);
        builder.append(" roti si numarul de inmatriculare este: ");
        builder.append(super.numarInmatriculare);
        System.out.println(builder);
    }
}
