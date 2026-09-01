package ro.ase.cts.factorymethod.clase;

public class SupaCiuperci extends Supa{

    public SupaCiuperci(float pret, float gramaj) {
        super(pret, gramaj);
    }

    @Override
    public void afisareDescriere() {
        StringBuilder builder = new StringBuilder();
        builder.append("Supa de ciuperci are ").append(super.toString());
        System.out.println(builder);
    }
}
