package ro.ase.cts.clase.chainOfResponsability;

public class ValidareCompletitudine extends AbstractValidatorDocument{
    @Override
    public boolean valideaza(Document document) {
        if(!document.completitudine){
            System.out.println("Documentul nu este complet!");
            return false;
        }

        System.out.println("Document complet.");

        if(urmator != null){
            return urmator.valideaza(document);
        }

        return true;
    }
}
