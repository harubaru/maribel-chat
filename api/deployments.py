import torch
import ray
from fastapi import FastAPI
from ray import serve
from transformers import AutoTokenizer, AutoModelForCausalLM
from pydantic import BaseModel

class Prompt(BaseModel):
    prompt: str
    length: int
    count: int

class Feedback(BaseModel):
    input: str
    output: str
    reward: float

app = FastAPI()

class GPTGenerator:
    def __init__(self, model_name_or_path: str):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name_or_path)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name_or_path,
            device_map='auto',
            load_in_8bit=True
        ).eval()

    def generate(self, prompt: str, max_length: int, count: int):
        output = {}

        input_ids = self.tokenizer.encode(
            prompt,
            return_tensors='pt'
        ).repeat(count, 1)

        output = self.model.generate(
            input_ids=input_ids,
            do_sample=True,
            max_new_tokens=max_length,
            temperature=0.8,
            top_p=0.9,
            typical_p=0.98,
            repetition_penalty=1.05,
            pad_token_id=self.tokenizer.eos_token_id,
            eos_token_id=198,
        )[:, input_ids.shape[1]:]

        output = self.tokenizer.batch_decode(
            output,
            skip_special_tokens=True
        )

        return output

@serve.deployment(route_prefix="/convogpt-6b", num_replicas=1, ray_actor_options={"num_gpus": 1})
@serve.ingress(app)
class GenerateConvoGPT6B:
    def __init__(self):
        self.generator = GPTGenerator("../../models/litv2-6b")

    @app.get("/generate")
    def get_generate(self, prompt: Prompt):
        return self.generator.generate(
            prompt.prompt,
            prompt.length,
            prompt.count
        )

    @app.post("/feedback")
    def post_feedback(self, feedback: Feedback):
        with open('feedback.jsonl', 'a') as f:
            f.write(f'{feedback.json()}\n')

convo6b = GenerateConvoGPT6B.bind()
