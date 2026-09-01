package ro.ase.cts.clase.adapter;

public class DocumentJuridicExtern {
    private String denumire;
    private String creator;
    private String descriere;

    public DocumentJuridicExtern(String denumire, String creator, String descriere) {
        this.denumire = denumire;
        this.creator = creator;
        this.descriere = descriere;
    }

    public String getDenumire() {
        return denumire;
    }

    public String getCreator() {
        return creator;
    }

    public String getDescriere() {
        return descriere;
    }
}
