package expo.modules.appblocker.rules.storage

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class RuleIdReaderTest {
  @Test
  fun readsTheIdOfEachRule() {
    val rulesJson = """[{"id":"app~com.a","target":"com.a"},{"id":"app~com.b","target":"com.b"}]"""
    assertEquals(setOf("app~com.a", "app~com.b"), RuleIdReader.readIds(rulesJson))
  }

  @Test
  fun rulesStoredWithoutAnIdUseTheIdBuiltFromTheTarget() {
    assertEquals(setOf("app~com.a"), RuleIdReader.readIds("""[{"target":"com.a"}]"""))
  }

  @Test
  fun aNullIdUsesTheIdBuiltFromTheTarget() {
    assertEquals(setOf("app~com.a"), RuleIdReader.readIds("""[{"id":null,"target":"com.a"}]"""))
  }

  @Test
  fun anEmptyListHasNoIds() {
    assertEquals(emptySet<String>(), RuleIdReader.readIds("[]"))
  }

  @Test
  fun unreadableJsonHasNoIdList() {
    assertNull(RuleIdReader.readIds("garbage"))
  }
}
