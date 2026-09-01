package ro.ase.cts.clase;

public class Pacient {
    private String pacient;
    private int gravitate;

    public Pacient(String pacient, int gravitate) {
        this.pacient = pacient;
        this.gravitate = gravitate;
    }

    public String getPacient() {
        return pacient;
    }

    public int getGravitate() {
        return gravitate;
    }
}
