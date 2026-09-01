package ro.ase.cts.clase.adapter;

public class Main {
    public static void proceseazaDocumente(AbstractDocumentJuridic docIntern){
        System.out.println("Titlu: " + docIntern.obtineTitlu());
        System.out.println("Autor: " + docIntern.obtineAutor());
        System.out.println("Continut: " + docIntern.obtineContinut());
    }

    public static void main(String[] args) {
        AbstractDocumentJuridic docIntern = new DocumentJuridicIntern("Contract proprietate", "Ion Popescu", "Datele despre proprietarul unui imobil");
        proceseazaDocumente(docIntern);

        DocumentJuridicExtern docExtern = new DocumentJuridicExtern("Cerere buletin", "Mara Andreea", "Cerere reinoinre buletin");
//        proceseazaDocumente(docExtern);

        AdapterDocument adapterDocument = new AdapterDocument(docExtern);
        proceseazaDocumente(adapterDocument);
    }
}
