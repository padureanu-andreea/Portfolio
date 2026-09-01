package ro.ase.cts.zoo;


import ro.ase.cts.animals.Animal;
import ro.ase.cts.zoo.ZooKeeper;

import java.util.AbstractList;
import java.util.ArrayList;
import java.util.List;

public class Zoo {
    private String name;
    private ZooKeeper zooKeeper;
    private List<Animal> animals;

    public Zoo(String name, ZooKeeper zooKeeper) {
        this.name = name;
        this.zooKeeper = zooKeeper;
        this.animals = new ArrayList<>();
    }

    public void addAnimal(Animal animal) {
        this.animals.add(animal);
    }

    public void feedAllAnimals() {
        for (Animal animal : animals) {
            this.zooKeeper.feedAnimal(animal);
        }
    }
}
