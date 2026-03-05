package internal

import kotlin.random.Random

object RandomNames {
    private val adjectives =
        listOf(
            "quick",
            "bright",
            "clever",
            "gentle",
            "brave",
            "calm",
            "eager",
            "fancy",
            "jolly",
            "kind",
            "lively",
            "merry",
            "proud",
            "smart",
            "witty",
            "bold",
            "cool",
            "daring",
            "eager",
            "fierce",
            "happy",
            "jolly",
            "keen",
            "mighty",
            "noble",
            "rapid",
            "swift",
            "vivid",
            "warm",
            "zealous",
        )

    private val nouns =
        listOf(
            "tiger",
            "eagle",
            "dolphin",
            "falcon",
            "panther",
            "hawk",
            "wolf",
            "lion",
            "bear",
            "fox",
            "raven",
            "swan",
            "jaguar",
            "lynx",
            "ocelot",
            "puma",
            "cheetah",
            "leopard",
            "bison",
            "elk",
            "deer",
            "stallion",
            "mustang",
            "cougar",
            "coyote",
            "badger",
            "wolverine",
            "marten",
            "sable",
            "ermine",
        )

    fun readable(separator: String = "_"): String {
        val adjective = adjectives.random()
        val noun = nouns.random()
        val number = Random.nextInt(100, 1000)
        return "${adjective}${separator}${noun}${separator}$number"
    }
}
