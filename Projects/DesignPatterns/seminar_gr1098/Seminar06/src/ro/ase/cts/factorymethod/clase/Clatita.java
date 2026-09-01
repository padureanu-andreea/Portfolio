package ro.ase.cts.factorymethod.clase;

public class Clatita extends Desert{
    public Clatita(float pretDesert, float gramajDesert, int caloriiDesert) {
        super(pretDesert, gramajDesert, caloriiDesert);
    }

    @Override
    public void afisareDescriere() {
        StringBuilder builder = new StringBuilder();
        builder.append("Clatita are ").append(super.toString());
        System.out.println(builder);
    }
}
