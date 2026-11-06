Generative AI has moved from experiment to everyday infrastructure in a remarkably short time. Yet most users have only a vague idea of what happens between submitting a prompt and receiving an answer, or why assistants built on similar technology behave so differently. In finance, these differences are not cosmetic. They determine whether a tool produces a reliable analysis, a plausible but incorrect figure in a client document, or a data-protection breach.

This post examines five of the most widely used AI assistants: the shared architecture behind them, the design choices that differentiate them, and their applications in finance and process automation.

## Market position

There is no single, independent measure of AI usage, so the market position of these assistants is best understood by combining three kinds of evidence.

The most reliable independent source is survey data. In a nationally representative survey conducted in February 2026, Pew Research Center found that 44% of US adults had used ChatGPT, 24% Google Gemini, 17% Microsoft Copilot, 14% Meta AI, 8% Grok and 6% Claude<sup class="fn" id="cite-1"><a href="#ref-1">1</a></sup>.

Company disclosures give the scale. OpenAI reported 900 million weekly active ChatGPT users in February 2026<sup class="fn" id="cite-2"><a href="#ref-2">2</a></sup>, and Google announced in August 2026 that the Gemini app had passed one billion monthly users<sup class="fn" id="cite-3"><a href="#ref-3">3</a></sup>. Microsoft reported more than 30 million paid Microsoft 365 Copilot seats in its July 2026 earnings<sup class="fn" id="cite-4"><a href="#ref-4">4</a></sup>. These figures are self-reported and use different definitions, weekly against monthly users and paid seats against free use, so they are not directly comparable.

Enterprise and developer usage tell a different story. Claude has a small consumer footprint, but Anthropic's IPO prospectus reports more than 11,900 customers paying over $100,000 a year as of September 2026<sup class="fn" id="cite-5"><a href="#ref-5">5</a></sup>. On OpenRouter, a platform through which developers access many models, open-weight models such as DeepSeek currently process the largest token volumes<sup class="fn" id="cite-6"><a href="#ref-6">6</a></sup>.

For this post, I have therefore selected the five assistants that are most relevant in finance rather than following a single ranking. ChatGPT, Gemini and Copilot are the three most used in Pew's survey, and Copilot is the assistant most finance professionals meet inside Excel, Outlook and PowerPoint. Claude is included because of its weight in enterprise and developer use, and Perplexity because its source-grounded design is directly relevant to financial research. Meta AI and Grok are widely used by consumers but play a smaller role in professional finance, and DeepSeek is discussed under open-weight models.

## The shared architecture

All five assistants are built on large language models (LLMs), and the core mechanism is largely the same across providers.

### Tokenisation and autoregressive prediction

Input text is first split into tokens, sub-word units that the model represents as numerical vectors (embeddings). The model is then trained with a single objective: given a sequence of tokens, predict a probability distribution over the next token. Generation is autoregressive. The model samples one token, appends it to the sequence, and repeats. Parameters such as temperature control how deterministic this sampling is, which is why the same prompt can produce different answers.

### The transformer and self-attention

The underlying architecture is the transformer<sup class="fn" id="cite-7"><a href="#ref-7">7</a></sup>. Its central component, self-attention, allows every token to weigh its relevance to every other token in the context window, the maximum sequence the model can process at once. This is what enables the model to resolve meaning from context, so that "liquidity" is interpreted differently in a discussion of central bank operations and one of a company's balance sheet. Several frontier models also use a mixture-of-experts design<sup class="fn" id="cite-8"><a href="#ref-8">8</a></sup>, in which only a subset of the model's parameters is activated for each token, reducing the computational cost of inference.

### From pretraining to alignment

Training proceeds in stages. Pretraining on very large text corpora gives the model broad linguistic and factual knowledge, but produces a system that continues text rather than one that follows instructions. Supervised fine-tuning (SFT) on curated examples of good responses then teaches it the format of an assistant. Finally, alignment techniques adjust the model towards preferred behaviour. The best known is reinforcement learning from human feedback(RLHF)<sup class="fn" id="cite-9"><a href="#ref-9">9</a></sup>, in which human raters compare responses, a reward model is trained on those preferences, and the language model is optimised against it. Variants replace part of the human feedback with AI-generated feedback guided by explicit principles<sup class="fn" id="cite-10"><a href="#ref-10">10</a></sup>.

### Reasoning and tool use

Two further layers increasingly define the assistants' capabilities. Reasoning models allocate additional computation at inference time, generating intermediate reasoning steps before producing a final answer<sup class="fn" id="cite-11"><a href="#ref-11">11</a></sup>. This test-time compute improves performance on quantitative and multi-step problems. Tool use, often implemented as function calling<sup class="fn" id="cite-12"><a href="#ref-12">12</a></sup>, allows the model to invoke external systems: web search, code execution, file retrieval or enterprise databases. The model decides when a tool is needed, formulates the call and incorporates the result. Much of the practical differentiation between assistants now lies in these layers rather than in the base model.

### A structural limitation

Because LLMs generate the statistically most plausible continuation rather than retrieving verified facts, they can produce fluent but false statements, commonly called hallucinations<sup class="fn" id="cite-13"><a href="#ref-13">13</a></sup>. This is a property of the mechanism, not an occasional defect. Its mitigation, through grounding in retrieved sources, code execution or human review, is central to any responsible use in finance.

## Differentiation

| Assistant | Developer | Architectural or product emphasis | Principal risk |
|---|---|---|---|
| ChatGPT | OpenAI | General-purpose multimodal model with reasoning modes, code execution and a broad tool ecosystem | Overconfident outputs outside its tools |
| Gemini | Google | Natively multimodal, very long context window, integration with Search and Workspace | Performance varies across task types |
| Perplexity | Perplexity AI | Retrieval-augmented answer engine routing between several underlying models | Answer quality bounded by retrieved sources |
| Claude | Anthropic | Long-context document analysis, coding and agentic tasks; principle-based alignment | Smaller consumer ecosystem |
| Copilot | Microsoft | Orchestration layer over third-party models, grounded in enterprise data via Microsoft Graph | Dependent on licensing and data governance setup |

### ChatGPT

ChatGPT is the most general of the five. Beyond text generation, it combines multimodal input (images, documents, voice), reasoning models and an integrated code-execution environment. The latter is particularly relevant for financial analysis: when the model analyses a dataset by writing and running Python, the resulting figures are computed deterministically rather than generated token by token, which makes them reproducible and auditable.

### Gemini

Gemini was trained as a natively multimodal model<sup class="fn" id="cite-14"><a href="#ref-14">14</a></sup>, processing text, images, audio and video within the same architecture rather than through separate components. Its very long context window<sup class="fn" id="cite-15"><a href="#ref-15">15</a></sup> allows an entire annual report, a full set of earnings call transcripts or a prospectus to be processed in a single pass, avoiding the information loss that occurs when documents must be split. Its integration with Google Search and Workspace makes it practical in organisations already using Google's productivity tools.

### Perplexity

Perplexity differs structurally from the others. It is less a model than a retrieval-augmented generation(RAG)<sup class="fn" id="cite-16"><a href="#ref-16">16</a></sup> system built on several underlying LLMs. For each query, it retrieves relevant web documents, ranks them, and conditions the model's answer on the retrieved passages, with citations. This grounding reduces hallucination and keeps answers current, but it shifts the risk to the retrieval step: if relevant evidence is not found or is ranked too low, the answer is incomplete. This is precisely the failure mode I examined in [my case study on how chunking shapes what AI finds in financial reports](projects/rag-financial-documents.html), where most misses in long reports were ranking failures rather than missing information.

### Claude

Claude has a modest consumer share but substantial enterprise and developer usage. It is associated with long-context document analysis, a measured writing style, and strong performance on coding and agentic workflows, in which the model plans and executes a sequence of tool calls with limited human intervention. Anthropic aligns it partly through constitutional AI<sup class="fn" id="cite-10-2"><a href="#ref-10">10</a></sup>, in which the model is trained to critique and revise its outputs against an explicit set of principles. In finance, this profile suits the review of reports, contracts and due diligence material, and the construction of automated multi-step workflows.

### Microsoft Copilot

Copilot is best understood as an orchestration layer rather than a distinct frontier model. It routes requests to models from OpenAI and, more recently, Anthropic<sup class="fn" id="cite-17"><a href="#ref-17">17</a></sup>, and grounds them in the user's organisational data through Microsoft Graph, including emails, Teams conversations, SharePoint documents and Excel workbooks, while respecting existing access permissions. Its competitive advantage is therefore distribution and data access rather than model capability. For banks and corporates already standardised on Microsoft infrastructure, it is often the path of least resistance through procurement, security review and compliance.

### Open-weight models

Outside these five, open-weight models such as DeepSeek, Meta's Llama and Alibaba's Qwen publish their parameters, allowing deployment on a firm's own infrastructure. They can be fine-tuned on proprietary data, often with parameter-efficient methods such as LoRA<sup class="fn" id="cite-18"><a href="#ref-18">18</a></sup>, and offer low marginal inference costs and full data residency. For institutions with strict confidentiality or regulatory constraints, these properties can outweigh a gap in raw capability.

## Applications in finance and automation

| Area | Typical applications |
|---|---|
| Research | Summarising filings, news and earnings calls; peer comparison; thematic screening |
| Document analysis | Extracting covenants and key terms from loan agreements, contracts and data rooms |
| Modelling support | Generating and auditing Excel formulas; writing Python and SQL for data pipelines |
| Reporting and communication | Drafting investment memos, pitch material, client updates and board papers |
| Compliance and risk | Screening documents against policy, transaction monitoring, flagging anomalous wording |
| Process automation | Agentic workflows for data collection, reconciliation, invoice processing and recurring reporting |

The constraints are common to all providers. Quantitative outputs should be derived from source data or executed code, never from the model's parametric memory. Confidential information should be processed only within approved enterprise environments with clear data-retention terms. And financial institutions must be able to document and explain AI-supported decisions under model risk management frameworks and the EU AI Act, which classifies certain uses, such as creditworthiness assessment of individuals, as high-risk<sup class="fn" id="cite-19"><a href="#ref-19">19</a></sup>.

## Fit by role

There is no universally best model. The relevant question is which system's architecture and integration profile matches a given workflow. On that basis, a reasonable mapping to common roles in finance is:

| Role | Best fit | Rationale |
|---|---|---|
| Investment banking analyst | Copilot, with ChatGPT for drafting | Work is concentrated in Excel, PowerPoint and Outlook |
| Equity research | Perplexity for news, Gemini for long filings | Source-grounded, current information plus long-context analysis |
| Private equity and M&A | Gemini or Claude | Long-context review of data rooms and legal and financial documents |
| Risk and compliance | An in-house open-weight model, or an approved enterprise assistant | Data residency, auditability and controlled deployment |
| Accounting and controlling | Copilot in Excel | Formula generation and reconciliation where the data already resides |
| Quant and data roles | ChatGPT or Claude | Code generation, debugging and explanation |
| Fintech and process automation | GPT or Claude through APIs, open-weight models for volume | Reliable function calling for agents; low marginal cost at scale |

## Conclusion

The five assistants examined here share a common foundation: transformer-based language models trained by next-token prediction and aligned through human and AI feedback. Their differentiation lies in the layers built around that foundation: retrieval, tool use, context length, enterprise integration and deployment model. In finance, these layers determine whether a system improves productivity or introduces operational, legal and reputational risk.

The decisive competence is therefore not identifying the "best" model, but matching architecture to task, and treating every output as a draft to be verified rather than a conclusion to be trusted.

---

## Sources

1. <span id="ref-1"></span>Pew Research Center (17 June 2026). [*Americans and AI 2026: Chatbots, smart devices and views on impact*](https://www.pewresearch.org/internet/2026/06/17/americans-and-ai-2026/). Survey conducted 17–23 February 2026. <a class="fn-back" href="#cite-1" aria-label="Back to text">↩</a>
2. <span id="ref-2"></span>OpenAI (27 February 2026), as reported by TechCrunch. [*ChatGPT reaches 900M weekly active users*](https://techcrunch.com/2026/02/27/chatgpt-reaches-900m-weekly-active-users). <a class="fn-back" href="#cite-2" aria-label="Back to text">↩</a>
3. <span id="ref-3"></span>Google (11 August 2026). [*The Gemini app now has over one billion monthly users*](https://blog.google/innovation-and-ai/products/gemini-app/one-billion-monthly-users/). The Keyword, Google's official blog. <a class="fn-back" href="#cite-3" aria-label="Back to text">↩</a>
4. <span id="ref-4"></span>Microsoft FY26 Q4 earnings call (29 July 2026), as reported by Office 365 for IT Pros. [*Azure tops $100 billion as Microsoft reports FY26 Q4 results*](https://office365itpros.com/2026/07/30/fy26-q4-microsoft-results/). <a class="fn-back" href="#cite-4" aria-label="Back to text">↩</a>
5. <span id="ref-5"></span>Anthropic, PBC (2026). [*Form S-1 Registration Statement*](https://www.sec.gov/Archives/edgar/data/0002130357/000162828026067168/anthropicpbc-sx1.htm). U.S. Securities and Exchange Commission. <a class="fn-back" href="#cite-5" aria-label="Back to text">↩</a>
6. <span id="ref-6"></span>OpenRouter. [*LLM rankings*](https://openrouter.ai/rankings) (accessed 5 November 2026). <a class="fn-back" href="#cite-6" aria-label="Back to text">↩</a>
7. <span id="ref-7"></span>Vaswani, A. et al. (2017). [*Attention is all you need*](https://arxiv.org/abs/1706.03762). NeurIPS 2017. <a class="fn-back" href="#cite-7" aria-label="Back to text">↩</a>
8. <span id="ref-8"></span>Shazeer, N. et al. (2017). [*Outrageously large neural networks: The sparsely-gated mixture-of-experts layer*](https://arxiv.org/abs/1701.06538). ICLR 2017. <a class="fn-back" href="#cite-8" aria-label="Back to text">↩</a>
9. <span id="ref-9"></span>Ouyang, L. et al. (2022). [*Training language models to follow instructions with human feedback*](https://arxiv.org/abs/2203.02155). NeurIPS 2022. <a class="fn-back" href="#cite-9" aria-label="Back to text">↩</a>
10. <span id="ref-10"></span>Bai, Y. et al. (2022). [*Constitutional AI: Harmlessness from AI feedback*](https://arxiv.org/abs/2212.08073). arXiv:2212.08073. <a class="fn-back" href="#cite-10" aria-label="Back to text">↩</a>
11. <span id="ref-11"></span>Wei, J. et al. (2022). [*Chain-of-thought prompting elicits reasoning in large language models*](https://arxiv.org/abs/2201.11903). NeurIPS 2022. <a class="fn-back" href="#cite-11" aria-label="Back to text">↩</a>
12. <span id="ref-12"></span>Schick, T. et al. (2023). [*Toolformer: Language models can teach themselves to use tools*](https://arxiv.org/abs/2302.04761). NeurIPS 2023. <a class="fn-back" href="#cite-12" aria-label="Back to text">↩</a>
13. <span id="ref-13"></span>Ji, Z. et al. (2023). [*Survey of hallucination in natural language generation*](https://arxiv.org/abs/2202.03629). ACM Computing Surveys, 55(12). <a class="fn-back" href="#cite-13" aria-label="Back to text">↩</a>
14. <span id="ref-14"></span>Gemini Team, Google (2023). [*Gemini: A family of highly capable multimodal models*](https://arxiv.org/abs/2312.11805). arXiv:2312.11805. <a class="fn-back" href="#cite-14" aria-label="Back to text">↩</a>
15. <span id="ref-15"></span>Gemini Team, Google (2024). [*Gemini 1.5: Unlocking multimodal understanding across millions of tokens of context*](https://arxiv.org/abs/2403.05530). arXiv:2403.05530. <a class="fn-back" href="#cite-15" aria-label="Back to text">↩</a>
16. <span id="ref-16"></span>Lewis, P. et al. (2020). [*Retrieval-augmented generation for knowledge-intensive NLP tasks*](https://arxiv.org/abs/2005.11401). NeurIPS 2020. <a class="fn-back" href="#cite-16" aria-label="Back to text">↩</a>
17. <span id="ref-17"></span>Microsoft Learn. [*Copilot in Microsoft 365 apps with Anthropic models*](https://learn.microsoft.com/microsoft-365/copilot/copilot-anthropic-apps). <a class="fn-back" href="#cite-17" aria-label="Back to text">↩</a>
18. <span id="ref-18"></span>Hu, E. J. et al. (2021). [*LoRA: Low-rank adaptation of large language models*](https://arxiv.org/abs/2106.09685). arXiv:2106.09685. <a class="fn-back" href="#cite-18" aria-label="Back to text">↩</a>
19. <span id="ref-19"></span>European Union (2024). [*Regulation (EU) 2024/1689 (Artificial Intelligence Act)*](https://eur-lex.europa.eu/eli/reg/2024/1689/oj). Official Journal of the European Union. <a class="fn-back" href="#cite-19" aria-label="Back to text">↩</a>

*These are my own views as a student. AI products change quickly, so features may differ from what is described here.*
