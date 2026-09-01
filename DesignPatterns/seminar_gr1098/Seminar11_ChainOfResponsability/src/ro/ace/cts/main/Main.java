package ro.ace.cts.main;

import ro.ace.cts.clase.*;

public class Main {
    public static void main(String[] args) {
        CalatorieHandler calatorieAutobuz = new CalatorieAutobuz();
        CalatorieHandler calatorieTroleibuz = new CalatorieTroleibuz();
        CalatorieHandler calatorieTramvai = new CalatorieTramvai();
        CalatorieHandler calatorieMetrou = new CalatorieMetrou();

        calatorieTroleibuz.setSuccesor(calatorieAutobuz);
        calatorieAutobuz.setSuccesor(calatorieTramvai);
        calatorieTramvai.setSuccesor(calatorieMetrou);

        System.out.println(calatorieTroleibuz.recomandariCalatorie(12));
        System.out.println(calatorieTroleibuz.recomandariCalatorie(2));
        System.out.println(calatorieTroleibuz.recomandariCalatorie(4));
        System.out.println(calatorieTroleibuz.recomandariCalatorie(7));
    }
}
