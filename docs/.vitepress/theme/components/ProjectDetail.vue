<script setup lang="ts">
import { computed } from "vue";
import { ArrowLeft, ArrowUpRight, Check, GitBranch, Layers3 } from "lucide-vue-next";
import { projects } from "../../data/site";

const props = defineProps<{ slug: string }>();
const project = computed(() => projects.find((item) => item.slug === props.slug));
</script>

<template>
  <main v-if="project" id="main-content" class="custom-page project-detail-page">
    <header class="project-detail-hero">
      <a class="back-link" href="/projects/">
        <ArrowLeft :size="17" aria-hidden="true" />
        返回项目列表
      </a>
      <div class="project-detail-hero__main">
        <div>
          <p class="eyebrow">{{ project.category }} / {{ project.year }}</p>
          <h1>{{ project.title }}</h1>
          <p class="project-detail-hero__eyebrow">{{ project.eyebrow }}</p>
          <p class="project-detail-hero__description">{{ project.description }}</p>
        </div>
        <div class="project-detail-hero__status">
          <span>Project status</span>
          <strong>{{ project.status }}</strong>
        </div>
      </div>
      <dl class="project-facts">
        <div v-for="fact in project.facts" :key="fact.label">
          <dt>{{ fact.label }}</dt>
          <dd>{{ fact.value }}</dd>
        </div>
        <div>
          <dt>技术栈</dt>
          <dd>{{ project.technologies.join(" · ") }}</dd>
        </div>
      </dl>
    </header>

    <div class="project-detail-content">
      <section aria-labelledby="background-title" class="project-story-block project-story-block--lead">
        <p class="section-index">01</p>
        <div>
          <p class="eyebrow">BACKGROUND</p>
          <h2 id="background-title">项目背景</h2>
          <p class="project-lead">{{ project.background }}</p>
        </div>
      </section>

      <section aria-labelledby="responsibilities-title" class="project-story-block">
        <p class="section-index">02</p>
        <div>
          <p class="eyebrow">RESPONSIBILITIES</p>
          <h2 id="responsibilities-title">我的职责</h2>
          <ul class="responsibility-grid">
            <li v-for="responsibility in project.responsibilities" :key="responsibility">
              <Check :size="18" aria-hidden="true" />
              <span>{{ responsibility }}</span>
            </li>
          </ul>
        </div>
      </section>

      <section aria-labelledby="architecture-title" class="project-story-block">
        <p class="section-index">03</p>
        <div>
          <p class="eyebrow">ARCHITECTURE</p>
          <h2 id="architecture-title">技术架构</h2>
          <div class="architecture-flow" aria-label="项目技术架构流程">
            <template v-for="(node, index) in project.architecture" :key="node">
              <div class="architecture-node">
                <Layers3 v-if="index === 0" :size="19" aria-hidden="true" />
                <GitBranch v-else :size="19" aria-hidden="true" />
                <span>{{ node }}</span>
              </div>
              <span v-if="index < project.architecture.length - 1" class="architecture-arrow" aria-hidden="true">→</span>
            </template>
          </div>
          <p class="architecture-note">架构图强调信息或请求的主路径；细节按可替换的边界组织，便于后续演进。</p>
        </div>
      </section>

      <section aria-labelledby="challenges-title" class="project-story-block">
        <p class="section-index">04</p>
        <div>
          <p class="eyebrow">CHALLENGES</p>
          <h2 id="challenges-title">关键难点</h2>
          <div class="challenge-list">
            <article v-for="(challenge, index) in project.challenges" :key="challenge.title">
              <span>{{ String(index + 1).padStart(2, "0") }}</span>
              <h3>{{ challenge.title }}</h3>
              <p>{{ challenge.description }}</p>
            </article>
          </div>
        </div>
      </section>

      <section aria-labelledby="outcomes-title" class="project-story-block">
        <p class="section-index">05</p>
        <div>
          <p class="eyebrow">OUTCOMES</p>
          <h2 id="outcomes-title">结果与链接</h2>
          <div class="outcome-panel">
            <ul>
              <li v-for="outcome in project.outcomes" :key="outcome">
                <Check :size="18" aria-hidden="true" />{{ outcome }}
              </li>
            </ul>
            <div class="outcome-panel__links">
              <a v-for="link in project.links" :key="link.label" :href="link.href">
                {{ link.label }} <ArrowUpRight :size="17" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
  <main v-else class="custom-page empty-state">
    <h1>没有找到这个项目</h1>
    <a class="button button--primary" href="/projects/">返回项目列表</a>
  </main>
</template>

