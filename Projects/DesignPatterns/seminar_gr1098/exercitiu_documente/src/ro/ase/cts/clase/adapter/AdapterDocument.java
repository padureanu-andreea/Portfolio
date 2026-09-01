package ro.ase.cts.clase.adapter;

public class AdapterDocument implements AbstractDocumentJuridic{
    private DocumentJuridicExtern documentJuridicExtern;

    public AdapterDocument(DocumentJuridicExtern documentJuridicExtern) {
        this.documentJuridicExtern = documentJuridicExtern;
    }

    @Override
    public String obtineTitlu() {
        return this.documentJuridicExtern.getDenumire();
    }

    @Override
    public String obtineAutor() {
        return this.documentJuridicExtern.getCreator();
    }

    @Override
    public String obtineContinut() {
        return this.documentJuridicExtern.getDescriere();
    }
}
