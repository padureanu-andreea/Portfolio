package ro.ase.cts.clase.chainOfResponsability;

public class ValidareFormat extends AbstractValidatorDocument{
    @Override
    public boolean valideaza(Document document) {
        if(!document.format){
            System.out.println("Documentul nu are formatul corect!");
            return false;
        }

        System.out.println("Documentul are formatul corect.");

        if(urmator != null){
            return urmator.valideaza(document);
        }

        return true;
    }
}
