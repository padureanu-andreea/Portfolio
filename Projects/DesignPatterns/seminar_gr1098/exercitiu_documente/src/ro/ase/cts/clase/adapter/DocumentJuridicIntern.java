package ro.ase.cts.clase.adapter;

public class DocumentJuridicIntern implements AbstractDocumentJuridic{
    private String titlu;
    private String autor;
    private String continut;

    public DocumentJuridicIntern(String titlu, String autor, String continut) {
        this.titlu = titlu;
        this.autor = autor;
        this.continut = continut;
    }

    @Override
    public String obtineTitlu() {
        return this.titlu;
    }

    @Override
    public String obtineAutor() {
        return this.autor;
    }

    @Override
    public String obtineContinut() {
        return this.continut;
    }
}
