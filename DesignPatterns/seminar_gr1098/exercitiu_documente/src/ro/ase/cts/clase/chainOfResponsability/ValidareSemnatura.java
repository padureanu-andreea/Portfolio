package ro.ase.cts.clase.chainOfResponsability;

public class ValidareSemnatura extends AbstractValidatorDocument{
    @Override
    public boolean valideaza(Document document) {
        if(!document.semnatura){
            System.out.println("Documentul nu e semnat!");
            return false;
        }
        System.out.println("Document semnat.");

        if(urmator != null){
            return urmator.valideaza(document);
        }

        return true;
    }
}
