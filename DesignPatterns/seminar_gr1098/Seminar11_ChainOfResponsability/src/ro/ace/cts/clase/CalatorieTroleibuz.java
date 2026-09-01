package ro.ace.cts.clase;

public class CalatorieTroleibuz extends CalatorieHandler{


    public CalatorieTroleibuz() {
        super();
    }

    @Override
    public String recomandariCalatorie(double distanta) {
        if(distanta < 3){
            return "Troleibuz";
        }
        return super.succesor.recomandariCalatorie(distanta);
    }
}
