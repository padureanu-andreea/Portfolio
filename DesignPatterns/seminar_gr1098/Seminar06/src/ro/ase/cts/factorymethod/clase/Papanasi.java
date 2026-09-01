package ro.ase.cts.factorymethod.clase;

public class Papanasi extends Desert{
    public Papanasi(float pretDesert, float gramajDesert, int caloriiDesert) {
        super(pretDesert, gramajDesert, caloriiDesert);
    }


    @Override
    public void afisareDescriere() {
        StringBuilder builder = new StringBuilder();
        builder.append("Papanasii au ").append(super.toString());
        System.out.println(builder);
    }
}
