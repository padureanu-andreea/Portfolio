package ro.ase.cts.main;

import ro.ase.cts.clase.NotaDePlata;
import ro.ase.cts.clase.INotaDePlata;
import ro.ase.cts.clase.decorator.NotaDePlata1Mai;
import ro.ase.cts.clase.decorator.NotaDePlataDecorator;
import ro.ase.cts.clase.decorator.NotaDePlataNoulAn;

public class Main {
    public static void main(String[] args) {
        INotaDePlata nota1 = new NotaDePlata(23.4f, "29.04.2026");
        nota1.printeaza();

        int a = 3;
        NotaDePlataDecorator decorator;
        if(a == 1){
            decorator = new NotaDePlataNoulAn(nota1);
        } else {
            decorator = new NotaDePlata1Mai(nota1);
        }

        //decizia de decorare se ia la runtime

//        NotaDePlataDecorator decorator = new NotaDePlataNoulAn(nota1);
        decorator.printeaza();
        decorator.printeazaFelicitare();

        //deci metodele trb puse in decorator separat ca eu pot sa aleg un tip de functionalitate pe care pot sa o adaug



    }
}
