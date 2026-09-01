package ro.ase.cts.clase.farmacie;

public class Medicament {
    private String nume;
    public void cumparaMedicament(){
        System.out.println("Medicamentul " + this.nume + " a fost cumparat.");
    }

    public Medicament(String nume) {
        this.nume = nume;
    }
}
