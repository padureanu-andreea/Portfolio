package ro.ase.cts.factorymethod.clase;

public class SupaLegume extends Supa{

    public SupaLegume(float pret, float gramaj) {
        super(pret, gramaj);
    }

    @Override
    public void afisareDescriere() {
        StringBuilder builder = new StringBuilder();
        builder.append("Supa de legume are ").append(super.toString());
        System.out.println(builder);
    }
}
