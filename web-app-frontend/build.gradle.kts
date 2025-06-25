import com.github.gradle.node.npm.task.NpmTask

plugins {
  id("com.github.node-gradle.node") version "7.0.2"
}

node {
  version.set("22.9.0")
  npmVersion.set("10.8.3")
  download.set(true)
}

tasks.register<NpmTask>("build") {
  group = "build"
  description = "Builds the React frontend using npm."
  dependsOn("npmInstall")
  args.set(listOf("run", "build"))
}
