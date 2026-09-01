package ro.ase.cts.main;

import ro.ase.cts.builderV1.AbstractBuilder;
import ro.ase.cts.builderV1.Internare;
import ro.ase.cts.builderV1.InternareBuilder;
import ro.ase.cts.builderV2.AbstractBuilderV2;
import ro.ase.cts.builderV2.InternareBuilderV2;
import ro.ase.cts.builderV3.InternareV3;

public class Main {
    public static void main(String[] args){
        Internare i1 = new Internare();
        i1.setNumePacient("Georgel");
        i1.setPatRabatabil(true);
        System.out.println("i1: " + i1);

        Internare i2 = new Internare();
        i2.setNumePacient("Georgica");
        i2.setHalatInterior(true);
        System.out.println("i2: " + i2);

        //pentru varianta 1
        AbstractBuilder builder = new InternareBuilder("Georgica");
        Internare i3 = builder.setPatRabatabil(true).build();
        System.out.println("i3 inainte de a crea a doua referinta: " + i3.toString());
        Internare i4 = builder.setPapuci(true).setNume("Gigel").build();
        System.out.println("i3: " + i3.toString());
        System.out.println("i4: " + i4.toString());

        //creez un al doilea builder ca sa fac un nou obiect
        AbstractBuilder builder2 = new InternareBuilder("Maria");
        Internare i8 = builder2.build();
        System.out.println("i8: " + i8.toString());
        Internare i7 = builder2.setMicDejun(true).setPapuci(true).build();
        System.out.println("i7: " + i7.toString());

        //pentru varianta 2
        AbstractBuilderV2 builderV2 = new InternareBuilderV2();
//        builderV2.setMicDejun(true);
        ro.ase.cts.builderV2.Internare i5 = builderV2.build("Gigi");
        ro.ase.cts.builderV2.Internare i6 = builderV2.build("Gigica");
        ro.ase.cts.builderV2.Internare i10 = builderV2.setPapuci(true).setHalat(true).setMicDejun(true).build("Irina");
        ro.ase.cts.builderV2.Internare i11 = builderV2.build("Vlad");

        i5.setHalatInterior(true);
        i5.setPapuciCamera(true);
        System.out.println("i5: " + i5);
        System.out.println("i6: " + i6.toString());
        System.out.println("i10: " + i10);
        System.out.println("i11: " + i11);

        //pentru varianta 3
        InternareV3 i9 = InternareV3.builderV3("Dorel").setHalatInterior(true).build();
        System.out.println("i9: " + i9);
        System.out.println(i9.getNumePacient());

    }
}
