package ro.ace.cts.clase;

public class CalatorieAutobuz extends CalatorieHandler{
    public CalatorieAutobuz() {
        super();
    }

    @Override
    public String recomandariCalatorie(double distanta) {
        if(distanta < 5){
            return "Autobuz";
        }
        return super.succesor.recomandariCalatorie(distanta);
    }
}
