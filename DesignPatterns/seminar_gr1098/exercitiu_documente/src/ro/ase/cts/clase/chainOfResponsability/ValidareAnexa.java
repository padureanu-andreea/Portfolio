package ro.ase.cts.clase.chainOfResponsability;

public class ValidareAnexa extends AbstractValidatorDocument{
    @Override
    public boolean valideaza(Document document) {
        if(!document.anexa){
            System.out.println("Documentul nu are anexa!");
            return false;
        }

        System.out.println("Documentul are anexa.");

        if(urmator != null){
            return urmator.valideaza(document);
        }

        return true;
    }
}
