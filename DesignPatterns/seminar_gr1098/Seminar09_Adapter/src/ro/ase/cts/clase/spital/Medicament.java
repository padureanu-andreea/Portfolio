package ro.ase.cts.clase.spital;

public class Medicament {
    private String nume;
    private float pret;

    public void achizitioneazaMedicament(){
        if(prezintaReteta()){
            System.out.println("Medicament " + this.nume + " a fost cumparat. Pretul este " + this.pret + " lei.");
        }
        else System.out.println("Nu a fost prezentata o reteta!");
    }

    public boolean prezintaReteta(){
        return this.nume.length() > 10;
    }

    public Medicament(String nume, float pret) {
        this.nume = nume;
        this.pret = pret;
    }

    public String getNume() {
        return nume;
    }

    public float getPret() {
        return pret;
    }
}
