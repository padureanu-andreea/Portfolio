package ro.ase.cts.clase.decorator;

public class ProdusStandard implements AbstractProdusPersonalizat{
    private String descriere;
    private double pret;

    public ProdusStandard(String descriere, double pret) {
        this.descriere = descriere;
        this.pret = pret;
    }

    @Override
    public String obtineDescriere() {
        return "Produs standard: " + this.descriere + ". Pretul este: " + this.pret;
    }

    @Override
    public double calculeazaPret() {
        return this.pret;
    }
}
