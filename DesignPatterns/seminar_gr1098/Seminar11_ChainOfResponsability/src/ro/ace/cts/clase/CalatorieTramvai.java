package ro.ace.cts.clase;

public class CalatorieTramvai extends CalatorieHandler{
    public CalatorieTramvai() {
        super();
    }

    @Override
    public String recomandariCalatorie(double distanta) {
        if(distanta < 10){
            return "Tramvai";
        }
        return super.succesor.recomandariCalatorie(distanta);
    }
}
