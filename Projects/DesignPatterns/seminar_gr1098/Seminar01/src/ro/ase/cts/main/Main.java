package ro.ase.cts.main;

import ro.ase.cts.animals.FoodType;
import ro.ase.cts.animals.Lion;
import ro.ase.cts.animals.Zebra;
import ro.ase.cts.zoo.Zoo;
import ro.ase.cts.zoo.ZooKeeper;

public class Main {
    public static void main(String[] args) {
        Zoo zoo = new Zoo("Zoo Baneasa", new ZooKeeper("Ionescu"));
        zoo.addAnimal(new Lion("Leon", 5, FoodType.MEAT, 65));
        zoo.addAnimal(new Zebra("Zeta", 4, FoodType.GRASS, 150));

        zoo.feedAllAnimals();
    }
}
