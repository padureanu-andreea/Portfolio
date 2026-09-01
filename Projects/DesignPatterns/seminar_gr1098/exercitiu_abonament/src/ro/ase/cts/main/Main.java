package ro.ase.cts.main;

import ro.ase.cts.clase.AbonamentLunar;
import ro.ase.cts.clase.AbstractMembership;
import ro.ase.cts.clase.AbstractSearchingFilter;
import ro.ase.cts.clase.Filtru;

public class Main {
    public static void main(String[] args) {
        AbstractMembership abonament = AbonamentLunar.getInstance("Abonament premium", 340.5, "15.03.2027");
        AbstractMembership abonament2 = AbonamentLunar.getInstance("Alt abonament", 234.4, "19.04.2026");

        Thread threadSecundar = new Thread(() -> {
            AbstractMembership abonament3 = AbonamentLunar.getInstance("Un alt abonament", 12.4, "16.04.2026");
            abonament3.afiseazaDetaliiAbonament();
        });
        threadSecundar.start();
        abonament.afiseazaDetaliiAbonament();
        abonament2.afiseazaDetaliiAbonament();

//        System.out.println(abonament);
//        System.out.println(abonament2);

//        System.out.println(abonament == abonament2 && abonament == abonament3);

        //filtre
        Filtru filtru1 = Filtru.builder().setAnAparitie(2026).setRating(8.8).build();
        Filtru filtru2 = Filtru.builder().setGen("comedie").build();
        Filtru filtru3 = Filtru.builder().setGen("drama").setAnAparitie(2025).build();

        System.out.println(filtru1.toString());
        System.out.println(filtru2.toString());
        System.out.println(filtru3.toString());
    }
}