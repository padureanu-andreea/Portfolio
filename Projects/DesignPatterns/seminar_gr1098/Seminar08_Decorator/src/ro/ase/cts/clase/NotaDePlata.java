package ro.ase.cts.clase;

public class NotaDePlata implements INotaDePlata{
    private float suma;
    private String data;

    public NotaDePlata(float suma, String data) {
        this.suma = suma;
        this.data = data;
    }

    @Override
    public void printeaza() {
        System.out.println("La data " + this.data + " a fost platita suma " + this.suma + " lei.");
    }
}
